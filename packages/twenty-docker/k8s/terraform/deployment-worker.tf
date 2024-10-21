resource "kubernetes_deployment" "twentycrm_worker" {
  metadata {
    name      = "${var.twentycrm_app_name}-worker"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
    labels = {
      app = "${var.twentycrm_app_name}-worker"
    }
  }

  spec {
    replicas = var.twentycrm_worker_replicas
    selector {
      match_labels = {
        app = "${var.twentycrm_app_name}-worker"
      }
    }

    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_surge       = "1"
        max_unavailable = "1"
      }
    }

    template {
      metadata {
        labels = {
          app = "${var.twentycrm_app_name}-worker"
        }
      }

      spec {
        container {
          image   = var.twentycrm_server_image
          name    = var.twentycrm_app_name
          stdin   = true
          tty     = true
          command = ["yarn", "worker:prod"]

          env {
            name  = "SERVER_URL"
            value = var.twentycrm_app_hostname
          }

          env {
            name  = "FRONT_BASE_URL"
            value = var.twentycrm_app_hostname
          }

          env {
            name  = "PG_DATABASE_URL"
            value = "postgres://twenty:${var.twentycrm_pgdb_admin_password}@${kubernetes_service.twentycrm_db.metadata.0.name}.${kubernetes_namespace.twentycrm.metadata.0.name}.svc.cluster.local/default"
          }

          env {
            name  = "CACHE_STORAGE_TYPE"
            value = "redis"
          }

          env {
            name  = "REDIS_URL"
            value = "redis://${kubernetes_service.twentycrm_redis.metadata.0.name}.${kubernetes_namespace.twentycrm.metadata.0.name}.svc.cluster.local:6379"
          }

          env {
            name  = "ENABLE_DB_MIGRATIONS"
            value = "false" #it already runs on the server
          }

          env {
            name  = "STORAGE_TYPE"
            value = "local"
          }
          env {
            name  = "MESSAGE_QUEUE_TYPE"
            value = "bull-mq"
          }

          env {
            name = "ACCESS_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = "tokens"
                key  = "accessToken"
              }
            }
          }

          env {
            name = "LOGIN_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = "tokens"
                key  = "loginToken"
              }
            }
          }

          env {
            name = "REFRESH_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = "tokens"
                key  = "refreshToken"
              }
            }
          }

          env {
            name = "FILE_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = "tokens"
                key  = "fileToken"
              }
            }
          }

          resources {
            requests = {
              cpu    = "250m"
              memory = "1024Mi"
            }
            limits = {
              cpu    = "1000m"
              memory = "2048Mi"
            }
          }
        }

        dns_policy     = "ClusterFirst"
        restart_policy = "Always"
      }
    }
  }
  depends_on = [
    kubernetes_deployment.twentycrm_db,
    kubernetes_deployment.twentycrm_redis,
    kubernetes_deployment.twentycrm_server,
    kubernetes_secret.twentycrm_tokens,
  ]
}
