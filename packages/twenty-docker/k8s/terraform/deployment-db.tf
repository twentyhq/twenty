resource "kubernetes_deployment" "twentycrm_db" {
  metadata {
    name      = "${local.twentycrm_app_name}-db"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
    labels = {
      app = "${local.twentycrm_app_name}-db"
    }
  }

  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "${local.twentycrm_app_name}-db"
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
          app = "${local.twentycrm_app_name}-db"
        }
      }

      spec {
        # security_context {
        #   fs_group = 0
        # }
        container {
          image = local.twentycrm_db_image
          name  = local.twentycrm_app_name
          stdin = true
          tty   = true
          security_context {
            allow_privilege_escalation = true
          }

          env {
            name  = "POSTGRES_PASSWORD"
            value = "twenty"
          }
          env {
            name  = "BITNAMI_DEBUG"
            value = true
          }

          port {
            container_port = 5432
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
            name       = "nfs-twentycrm-db-data"
            mount_path = "/bitnami/postgresql"
          }
        }

        volume {
          name = "nfs-twentycrm-db-data"

          persistent_volume_claim {
            claim_name = "nfs-twentycrm-db-data-pvc"
          }
        }

        dns_policy     = "ClusterFirst"
        restart_policy = "Always"
      }
    }
  }
}
