resource "kubernetes_deployment" "twentycrm_server" {
  metadata {
    name      = "${var.twentycrm_app_name}-server"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
    labels = {
      app = "${var.twentycrm_app_name}-server"
    }
  }

  spec {
    replicas = var.twentycrm_server_replicas
    selector {
      match_labels = {
        app = "${var.twentycrm_app_name}-server"
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
          app = "${var.twentycrm_app_name}-server"
        }
      }

      spec {
        container {
          image = var.twentycrm_server_image
          name  = var.twentycrm_app_name
          stdin = true
          tty   = true

          env {
            name  = "NODE_PORT"
            value = "3000"
          }

          env {
            name  = "SERVER_URL"
            value = var.twentycrm_app_hostname
          }

          env {
            name  = "PG_DATABASE_URL"
            value = "postgres://twenty:${var.twentycrm_pgdb_admin_password}@${kubernetes_service.twentycrm_db.metadata.0.name}.${kubernetes_namespace.twentycrm.metadata.0.name}.svc.cluster.local/default"
          }
          env {
            name  = "REDIS_URL"
            value = "redis://${kubernetes_service.twentycrm_redis.metadata.0.name}.${kubernetes_namespace.twentycrm.metadata.0.name}.svc.cluster.local:6379"
          }
          env {
            name  = "DISABLE_DB_MIGRATIONS"
            value = "false"
          }

          env {
            name  = "STORAGE_TYPE"
            value = "local"
          }
          env {
            name  = "ACCESS_TOKEN_EXPIRES_IN"
            value = "7d"
          }
          env {
            name  = "LOGIN_TOKEN_EXPIRES_IN"
            value = "1h"
          }
          env {
            name = "APP_SECRET"
            value_from {
              secret_key_ref {
                name = "tokens"
                key  = "accessToken"
              }
            }
          }

          port {
            container_port = 3000
            protocol       = "TCP"
          }

          resources {
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "1000m"
              memory = "1024Mi"
            }
          }

          volume_mount {
            name       = "server-data"
            mount_path = var.twentycrm_server_data_mount_path
          }

          volume_mount {
            name       = "docker-data"
            mount_path = var.twentycrm_docker_data_mount_path
          }
        }

        volume {
          name = "server-data"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.server.metadata.0.name
          }
        }

        volume {
          name = "docker-data"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.docker_data.metadata.0.name
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
    kubernetes_secret.twentycrm_tokens
  ]
}
